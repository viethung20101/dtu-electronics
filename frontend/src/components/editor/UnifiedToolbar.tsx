import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Folder,
  FolderPlus,
  FolderDown,
  Save,
  Play,
  Square,
  RotateCcw,
  MousePointer2,
  Hand,
  GitCommit,
  Zap,
  Type,
  Move,
  Trash2,
  Copy,
  Scissors,
  Undo2,
  Redo2,
  Lock,
  Unlock,
  PenTool,
  Search,
  Bell,
  HelpCircle,
  Settings,
  Share2,
  User,
  Loader2,
} from 'lucide-react';

import { useEditorStore, chipFileGroupId } from '../../store/useEditorStore';
import { useSimulatorStore, DEFAULT_BOARD_POSITION } from '../../store/useSimulatorStore';
import { useElectricalStore } from '../../store/useElectricalStore';
import { useProjectStore } from '../../store/useProjectStore';
import { compileCode } from '../../services/compilation';
import {
  compileRom,
  isChipProgramFile,
  formatForFile,
  targetForChip,
} from '../../services/romCompileService';
import { compileChip } from '../../services/chipCompileService';
import { clearChipDrives } from '../../simulation/customChips/chipPinDrives';
import { requestElectricalResolve } from '../../simulation/spice/electricalResolveHook';
import { reportRunEvent } from '../../services/metricsService';
import { parseCompileResult } from '../../utils/compilationLogger';
import type { CompilationLog, CompileTarget } from '../../utils/compilationLogger';
import { exportToWokwiZip } from '../../utils/wokwiZip';
import { importProjectFile, PROJECT_FILE_ACCEPT } from '../../utils/importProject';
import { BOARD_KIND_FQBN, isPiBoardKind, boardDisplayName } from '../../types/board';
import type { BoardKind } from '../../types/board';
import { triggerSaveAction } from '../../lib/proSaveAction';

import './UnifiedToolbar.css';

interface UnifiedToolbarProps {
  onSaveClick?: () => void;
  onNewClick?: () => void;
}

export const UnifiedToolbar: React.FC<UnifiedToolbarProps> = ({ onSaveClick, onNewClick }) => {
  const { t } = useTranslation();
  const importInputRef = useRef<HTMLInputElement>(null);

  // Stores
  const { files, codeChangedSinceLastCompile, markCompiled } = useEditorStore();
  const {
    boards,
    activeBoardId,
    compileBoardProgram,
    loadMicroPythonProgram,
    updateBoard,
    startBoard,
    stopBoard,
    resetBoard,
    startSimulation,
    stopSimulation,
    resetSimulation,
    running,
    compiledHex,
  } = useSimulatorStore();

  const currentProject = useProjectStore((s) => s.currentProject);
  const electricalPaused = useElectricalStore((s) => s.paused);
  const setElectricalPaused = useElectricalStore((s) => s.setPaused);
  const isBoardless = boards.length === 0;

  // Local state
  const [compiling, setCompiling] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(
    null,
  );
  const [activeTool, setActiveTool] = useState<
    'select' | 'pan' | 'wire' | 'spark' | 'text' | 'move'
  >('select');
  const [zoom, setZoom] = useState(1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const activeBoard = boards.find((b) => b.id === activeBoardId) ?? boards[0];

  // Helper for prep custom chips
  const prepareCustomChips = useCallback(
    async (
      chips: { id: string; properties: Record<string, any> }[],
      boardFiles: { name: string; content: string }[],
    ) => {
      const codeChanged = useEditorStore.getState().codeChangedSinceLastCompile;
      const updateComponent = useSimulatorStore.getState().updateComponent;
      let failed = 0;

      for (const chip of chips) {
        const live = useSimulatorStore.getState().components.find((c) => c.id === chip.id);
        const props = { ...(live?.properties ?? chip.properties) } as Record<string, any>;
        const chipLabel = String(props.chipName ?? 'custom chip');
        const sourceC = String(props.sourceC ?? '');
        const chipJson = String(props.chipJson ?? '{}');
        let changed = false;

        if (!String(props.wasmBase64 ?? '') && sourceC) {
          try {
            const r = await compileChip(sourceC, chipJson);
            if (r.success && r.wasm_base64) {
              props.wasmBase64 = r.wasm_base64;
              changed = true;
            } else {
              failed++;
            }
          } catch {
            failed++;
          }
        }

        const programFile = String(props.programFile ?? '').trim();
        if (programFile && (!String(props.romBytes ?? '') || codeChanged)) {
          const chipGroupFiles = useEditorStore.getState().getGroupFiles(chipFileGroupId(chip.id));
          const file =
            chipGroupFiles.find((f) => f.name === programFile) ??
            boardFiles.find((f) => f.name === programFile);
          if (file) {
            const target = targetForChip(chipJson);
            const fmt = formatForFile(programFile);
            try {
              const rr = await compileRom(file.content, target, fmt);
              if (rr.success && rr.rom_base64) {
                props.romBytes = rr.rom_base64;
                props.programFile = programFile;
                changed = true;
              } else {
                failed++;
              }
            } catch {
              failed++;
            }
          } else {
            failed++;
          }
        }

        if (changed) {
          updateComponent(chip.id, { properties: props } as any);
        }
      }
      return { failed };
    },
    [],
  );

  // Compile
  const handleCompile = async () => {
    setCompiling(true);
    setToast({ type: 'info', text: 'Compiling sketch...' });

    const componentsForCompile = useSimulatorStore.getState().components;
    const customChips = componentsForCompile.filter((c) => c.metadataId === 'custom-chip');
    const chipProgramFiles = new Set<string>();
    for (const chip of customChips) {
      const pf = String((chip.properties as any)?.programFile ?? '').trim();
      if (pf) chipProgramFiles.add(pf);
    }

    if (customChips.length > 0) {
      const boardFiles = activeBoard?.activeFileGroupId
        ? useEditorStore.getState().getGroupFiles(activeBoard.activeFileGroupId)
        : files;
      await prepareCustomChips(customChips, boardFiles);
    }

    const kind = activeBoard?.boardKind;
    if (isPiBoardKind(kind)) {
      setToast({ type: 'success', text: 'Ready (Pi 3B)' });
      setCompiling(false);
      return true;
    }

    if (activeBoard?.languageMode === 'micropython' && activeBoardId) {
      try {
        const groupFiles = useEditorStore.getState().getGroupFiles(activeBoard.activeFileGroupId);
        const pyFiles = groupFiles.map((f) => ({ name: f.name, content: f.content }));
        await loadMicroPythonProgram(activeBoardId, pyFiles);
        setToast({ type: 'success', text: 'MicroPython loaded successfully' });
        setCompiling(false);
        return true;
      } catch (err: any) {
        setToast({ type: 'error', text: err?.message || 'MicroPython load failed' });
        setCompiling(false);
        return false;
      }
    }

    const fqbn = kind ? BOARD_KIND_FQBN[kind] : null;
    if (!fqbn) {
      setToast({ type: 'error', text: 'No board selected or FQBN missing' });
      setCompiling(false);
      return false;
    }

    try {
      const groupFiles = activeBoard?.activeFileGroupId
        ? useEditorStore.getState().getGroupFiles(activeBoard.activeFileGroupId)
        : files;
      const sketchFiles = (groupFiles.length > 0 ? groupFiles : files)
        .filter((f) => !chipProgramFiles.has(f.name) && !isChipProgramFile(f.name))
        .map((f) => ({
          name: f.name,
          content: f.content,
        }));

      const result = await compileCode(sketchFiles, fqbn, currentProject?.id ?? null, () => {}, {
        boardOptions: activeBoard?.boardOptions,
        spiffsFiles: activeBoard?.spiffsFiles,
        libraries: activeBoard?.libraries?.length ? activeBoard.libraries : null,
      });

      if (result.success) {
        const program = result.hex_content ?? result.binary_content ?? null;
        if (program && activeBoardId) {
          compileBoardProgram(activeBoardId, program);
          if (result.has_wifi !== undefined) {
            updateBoard(activeBoardId, { hasWifi: result.has_wifi });
          }
        }
        setToast({ type: 'success', text: 'Compiled successfully!' });
        markCompiled();
        setCompiling(false);
        return true;
      } else {
        const errText = result.error || result.stderr || 'Compile failed';
        setToast({ type: 'error', text: errText });
        if (activeBoardId) {
          updateBoard(activeBoardId, { compiledProgram: null });
        }
        setCompiling(false);
        return false;
      }
    } catch (err: any) {
      setToast({ type: 'error', text: err?.message || 'Compile failed' });
      setCompiling(false);
      return false;
    }
  };

  // Play
  const handlePlay = async () => {
    if (isBoardless) {
      const customChips = useSimulatorStore
        .getState()
        .components.filter((c) => c.metadataId === 'custom-chip');
      if (customChips.length > 0) {
        setCompiling(true);
        try {
          await prepareCustomChips(customChips, files);
        } catch {}
        setCompiling(false);
        useSimulatorStore.getState().restartParts();
      }
      setElectricalPaused(false);
      setToast({ type: 'success', text: 'Simulation resumed' });
      return;
    }

    if (activeBoardId) {
      const board = boards.find((b) => b.id === activeBoardId);
      if (board?.languageMode === 'micropython') {
        if (board.running) {
          stopBoard(activeBoardId);
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
        setCompiling(true);
        try {
          const groupFiles = useEditorStore.getState().getGroupFiles(board.activeFileGroupId);
          const pyFiles = groupFiles.map((f) => ({ name: f.name, content: f.content }));
          await loadMicroPythonProgram(activeBoardId, pyFiles);
        } catch (err: any) {
          setToast({ type: 'error', text: err?.message || 'MicroPython load failed' });
          setCompiling(false);
          return;
        }
        setCompiling(false);
        startBoard(activeBoardId);
        setToast({ type: 'success', text: 'Simulation started' });
        return;
      }

      const isQemuBoard =
        board?.boardKind &&
        (isPiBoardKind(board.boardKind) ||
          board.boardKind.startsWith('esp32') ||
          board.boardKind.includes('stm32'));

      if (!board?.compiledProgram || codeChangedSinceLastCompile) {
        const ok = await handleCompile();
        if (ok) {
          startBoard(activeBoardId);
          setToast({ type: 'success', text: 'Simulation started' });
        }
        return;
      }

      startBoard(activeBoardId);
      setToast({ type: 'success', text: 'Simulation started' });
      return;
    }

    // Fallback
    if (!compiledHex || codeChangedSinceLastCompile) {
      const ok = await handleCompile();
      if (ok) {
        startSimulation();
        setToast({ type: 'success', text: 'Simulation started' });
      }
    } else {
      startSimulation();
      setToast({ type: 'success', text: 'Simulation started' });
    }
  };

  // Stop
  const handleStop = () => {
    if (isBoardless) {
      setElectricalPaused(true);
      clearAllChipDrives();
      setToast({ type: 'info', text: 'Simulation stopped' });
      return;
    }
    const runningBoards = useSimulatorStore.getState().boards.filter((b) => b.running);
    if (runningBoards.length > 0) runningBoards.forEach((b) => stopBoard(b.id));
    else if (activeBoardId) stopBoard(activeBoardId);
    else stopSimulation();
    clearAllChipDrives();
    setToast({ type: 'info', text: 'Simulation stopped' });
  };

  // Reset
  const handleReset = () => {
    if (activeBoardId) resetBoard(activeBoardId);
    else resetSimulation();
    setToast({ type: 'info', text: 'Simulation reset' });
  };

  // Import project
  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!importInputRef.current) return;
    importInputRef.current.value = '';
    if (!file) return;
    try {
      const result = await importProjectFile(file);
      if (result.kind === 'vlx') {
        setToast({ type: 'success', text: `Imported ${file.name}` });
        return;
      }
      const { loadFiles } = useEditorStore.getState();
      const { setComponents, setWires, setBoardType, setBoardPosition, stopSimulation } =
        useSimulatorStore.getState();
      stopSimulation();
      if (result.boardType) setBoardType(result.boardType);
      setBoardPosition(result.boardPosition);
      setComponents(result.components);
      setWires(result.wires);
      if (result.files.length > 0) loadFiles(result.files);
      setToast({ type: 'success', text: `Imported ${file.name}` });
    } catch (err: any) {
      setToast({ type: 'error', text: err?.message || 'Import failed' });
    }
  };

  // Export project
  const handleExport = async () => {
    try {
      const {
        components,
        wires,
        boardType: legacyBoardType,
        boardPosition,
      } = useSimulatorStore.getState();
      const projectName =
        files.find((f) => f.name.endsWith('.ino'))?.name.replace('.ino', '') || 'cvs-project';
      await exportToWokwiZip(files, components, wires, legacyBoardType, projectName, boardPosition);
      setToast({ type: 'success', text: 'Exported project successfully!' });
    } catch {
      setToast({ type: 'error', text: 'Export failed.' });
    }
  };

  // Active Tool Switching
  const changeTool = (tool: typeof activeTool) => {
    setActiveTool(tool);
    window.dispatchEvent(new CustomEvent('velxio-active-tool-changed', { detail: tool }));
  };

  // Zoom
  const onZoomIn = () => {
    window.dispatchEvent(new CustomEvent('velxio-zoom-in'));
  };

  const onZoomOut = () => {
    window.dispatchEvent(new CustomEvent('velxio-zoom-out'));
  };

  const onZoomReset = () => {
    window.dispatchEvent(new CustomEvent('velxio-zoom-reset'));
  };

  // Undo / Redo
  const onUndo = () => {
    window.dispatchEvent(new CustomEvent('velxio-undo'));
  };

  const onRedo = () => {
    window.dispatchEvent(new CustomEvent('velxio-redo'));
  };

  // Delete / Lock / Unlock
  const onDelete = () => {
    window.dispatchEvent(new CustomEvent('velxio-delete-selected'));
  };

  const onLock = () => {
    window.dispatchEvent(new CustomEvent('velxio-lock-selected'));
  };

  const onUnlock = () => {
    window.dispatchEvent(new CustomEvent('velxio-unlock-selected'));
  };

  const onPenClick = () => {
    setToast({
      type: 'info',
      text: 'Pen tool activated: click or double click elements to annotate.',
    });
  };

  const onCopy = () => {
    setToast({ type: 'info', text: 'Component copied!' });
  };

  const onCut = () => {
    setToast({ type: 'info', text: 'Component cut!' });
  };

  // Search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchVal(val);
    window.dispatchEvent(new CustomEvent('velxio-component-search', { detail: val }));
  };

  // Event Listeners for feedback from Canvas
  useEffect(() => {
    const handleZoomChanged = (e: CustomEvent<number>) => {
      setZoom(e.detail);
    };
    const handleHistoryChanged = (e: CustomEvent<{ canUndo: boolean; canRedo: boolean }>) => {
      setCanUndo(e.detail.canUndo);
      setCanRedo(e.detail.canRedo);
    };
    const handleSelectionChanged = (e: CustomEvent<{ hasSelection: boolean }>) => {
      setHasSelection(e.detail.hasSelection);
    };

    window.addEventListener('velxio-zoom-changed' as any, handleZoomChanged);
    window.addEventListener('velxio-history-changed' as any, handleHistoryChanged);
    window.addEventListener('velxio-selection-changed' as any, handleSelectionChanged);

    return () => {
      window.removeEventListener('velxio-zoom-changed' as any, handleZoomChanged);
      window.removeEventListener('velxio-history-changed' as any, handleHistoryChanged);
      window.removeEventListener('velxio-selection-changed' as any, handleSelectionChanged);
    };
  }, []);

  // Clear toast after 4s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const activeBoardRunning = boards.some((b) => b.running) || running;

  return (
    <div className="unified-toolbar-container">
      {/* Hidden input for importing files */}
      <input
        type="file"
        ref={importInputRef}
        onChange={handleImportFile}
        accept={PROJECT_FILE_ACCEPT}
        style={{ display: 'none' }}
      />

      {/* LEFT GROUP: File tools, Simulation, Zoom */}
      <div className="unified-tb-left">
        <button
          className="unified-tb-btn unified-tb-file-btn"
          title="Open Folder / Workspace"
          onClick={() => {
            const explorerBtn = document.querySelector('.explorer-toggle-btn') as HTMLButtonElement;
            if (explorerBtn) explorerBtn.click();
          }}
        >
          <Folder size={16} />
        </button>

        <button
          className="unified-tb-btn unified-tb-file-btn"
          title="New Workspace"
          onClick={onNewClick}
        >
          <FolderPlus size={16} />
        </button>

        <button
          className="unified-tb-btn unified-tb-file-btn"
          title="Import Project (.vlx / .zip)"
          onClick={handleImportClick}
        >
          {/* Custom import/export arrow-folder SVG */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z" />
            <line x1="12" y1="10" x2="18" y2="10" />
            <polyline points="15 7 18 10 15 13" />
          </svg>
        </button>

        <button
          className="unified-tb-btn unified-tb-file-btn"
          title="Save Workspace (Ctrl+S)"
          onClick={onSaveClick}
        >
          <Save size={16} />
        </button>

        <div className="unified-tb-divider" />

        {/* Play / Stop / Reset */}
        {compiling ? (
          <button className="unified-tb-play-btn" disabled>
            <Loader2 size={16} className="unified-tb-spin" />
          </button>
        ) : (
          <button
            className="unified-tb-play-btn"
            title="Start Simulation"
            onClick={handlePlay}
            disabled={activeBoardRunning}
          >
            <Play size={15} fill="currentColor" stroke="none" />
          </button>
        )}

        <button
          className="unified-tb-stop-btn"
          title="Stop Simulation"
          onClick={handleStop}
          disabled={!activeBoardRunning}
        >
          <Square size={13} fill="currentColor" stroke="none" />
        </button>

        <button className="unified-tb-reset-btn" title="Reset Simulation" onClick={handleReset}>
          <RotateCcw size={15} />
        </button>

        <div className="unified-tb-divider" />

        {/* Zoom Controls Pill */}
        <div className="unified-tb-zoom-pill">
          <button title="Zoom Out" onClick={onZoomOut}>
            -
          </button>
          <span
            className="unified-tb-zoom-percentage"
            title="Reset Zoom View"
            onClick={onZoomReset}
          >
            {Math.round(zoom * 100)}%
          </span>
          <button title="Zoom In" onClick={onZoomIn}>
            +
          </button>
        </div>
      </div>

      {/* CENTER GROUP: Edit canvas tools */}
      <div className="unified-tb-center">
        <button
          className={`unified-tb-tool-btn ${activeTool === 'select' ? 'active-cyan' : ''}`}
          title="Selection Tool"
          onClick={() => changeTool('select')}
        >
          <MousePointer2 size={16} fill={activeTool === 'select' ? 'currentColor' : 'none'} />
        </button>

        <button
          className={`unified-tb-tool-btn ${activeTool === 'pan' ? 'active-tool' : ''}`}
          title="Pan Hand Tool"
          onClick={() => changeTool('pan')}
        >
          <Hand size={16} />
        </button>

        <button
          className={`unified-tb-tool-btn ${activeTool === 'wire' ? 'active-tool' : ''}`}
          title="Wire Connection Tool"
          onClick={() => changeTool('wire')}
        >
          {/* Custom Wire Path SVG */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="2" y="2" width="4" height="4" rx="1" fill="currentColor" />
            <rect x="18" y="18" width="4" height="4" rx="1" fill="currentColor" />
            <path d="M4 6v8a4 4 0 0 0 4 4h10" />
          </svg>
        </button>

        <button
          className={`unified-tb-tool-btn ${activeTool === 'spark' ? 'active-tool' : ''}`}
          title="Spark / Lightning Tool"
          onClick={() => changeTool('spark')}
        >
          <Zap size={16} />
        </button>

        <button
          className={`unified-tb-tool-btn ${activeTool === 'text' ? 'active-tool' : ''}`}
          title="Text Label Tool"
          onClick={() => changeTool('text')}
        >
          <Type size={16} />
        </button>

        <button
          className={`unified-tb-tool-btn ${activeTool === 'move' ? 'active-tool' : ''}`}
          title="Move Element Tool"
          onClick={() => changeTool('move')}
        >
          <Move size={16} />
        </button>

        <button
          className="unified-tb-tool-btn"
          title="Delete Selection (Del / Backspace)"
          onClick={onDelete}
          disabled={!hasSelection}
        >
          <Trash2 size={16} />
        </button>

        <div className="unified-tb-divider" />

        {/* Copy, Cut, Undo, Redo */}
        <button
          className="unified-tb-tool-btn"
          title="Duplicate Component"
          onClick={onCopy}
          disabled={!hasSelection}
        >
          <Copy size={16} />
        </button>

        <button
          className="unified-tb-tool-btn"
          title="Cut Element"
          onClick={onCut}
          disabled={!hasSelection}
        >
          <Scissors size={16} />
        </button>

        <button
          className="unified-tb-tool-btn"
          title="Undo Action"
          onClick={onUndo}
          disabled={!canUndo}
        >
          <Undo2 size={16} />
        </button>

        <button
          className="unified-tb-tool-btn"
          title="Redo Action"
          onClick={onRedo}
          disabled={!canRedo}
        >
          <Redo2 size={16} />
        </button>

        <div className="unified-tb-divider" />

        {/* Lock, Unlock, Pen */}
        <button
          className="unified-tb-tool-btn"
          title="Lock Position"
          onClick={onLock}
          disabled={!hasSelection}
        >
          <Lock size={16} />
        </button>

        <button
          className="unified-tb-tool-btn"
          title="Unlock Position"
          onClick={onUnlock}
          disabled={!hasSelection}
        >
          <Unlock size={16} />
        </button>

        <button className="unified-tb-tool-btn" title="Annotator Pen" onClick={onPenClick}>
          <PenTool size={16} />
        </button>
      </div>

      {/* RIGHT GROUP: Search, Help/Settings, Share, Profile */}
      <div className="unified-tb-right">
        {/* Search */}
        <div className="unified-tb-search">
          <Search size={14} />
          <input
            type="text"
            placeholder="Search components..."
            value={searchVal}
            onChange={handleSearchChange}
          />
        </div>

        {/* Notifications, Help, Settings */}
        <button className="unified-tb-icon-btn" title="Notifications">
          <Bell size={16} />
        </button>

        <button className="unified-tb-icon-btn" title="Help / Documentation">
          <HelpCircle size={16} />
        </button>

        <button className="unified-tb-icon-btn" title="Settings">
          <Settings size={16} />
        </button>

        {/* Share cyan button */}
        <button className="unified-tb-share-btn" title="Share Project" onClick={handleExport}>
          <Share2 size={14} />
          <span>Share</span>
        </button>

        {/* Avatar */}
        <div className="unified-tb-avatar" title="User Profile">
          <User size={16} />
        </div>
      </div>

      {/* Floating high-fidelity status toast indicator */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background:
              toast.type === 'error' ? '#ef5350' : toast.type === 'success' ? '#4caf50' : '#00e5ff',
            color: toast.type === 'error' || toast.type === 'success' ? '#ffffff' : '#121212',
            padding: '10px 18px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <span>{toast.text}</span>
        </div>
      )}
    </div>
  );
};
