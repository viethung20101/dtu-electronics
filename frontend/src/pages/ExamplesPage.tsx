import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExamplesGallery } from '../components/examples/ExamplesGallery';
import { CommunityProjectsGrid } from '../components/examples/CommunityProjectsGrid';
import { AppHeader } from '../components/layout/AppHeader';
import { useLocalizedHref } from '../i18n/useLocalizedNavigate';
import { useSEO } from '../utils/useSEO';
import { getSeoMeta } from '../seoRoutes';
import type { ExampleProject } from '../data/examples';
import './ExamplesPage.css';
import IconVectorHero from '../assets/generated/vector_167_439.svg';
import IconVectorFeatures from '../assets/generated/vector_186_600.svg';

export const ExamplesPage: React.FC = () => {
  const localize = useLocalizedHref();
  useSEO(getSeoMeta('/examples')!);

  const navigate = useNavigate();

  const handleLoadExample = (example: ExampleProject) => {
    navigate(localize(`/example/${example.id}`));
  };

  return (
    <div className="examples-page">
      {/* Background Vectors */}
      <img src={IconVectorHero} className="examples-vector examples-vector-left" alt="" />
      <img src={IconVectorFeatures} className="examples-vector examples-vector-right" alt="" />

      {/* Main Container */}
      <div className="examples-container-centered">
        {/* Main Branding Header */}
        <AppHeader />
        <div className="examples-body">
          <ExamplesGallery onLoadExample={handleLoadExample} />
          <CommunityProjectsGrid />
        </div>
      </div>
    </div>
  );
};
