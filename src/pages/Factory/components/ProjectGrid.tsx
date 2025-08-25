import React from "react";
import ProjectCard from "./ProjectCard";
import { FactoryInterface } from "../types/factory";

interface ProjectGridProps {
  factories: FactoryInterface[];
  onEditProject: (factoryId: number) => void;
  onDeleteProject: (factoryId: number, factoryName: string) => void;
  onParameterUpdate: (parameterData: any) => void;
  onShowHistory: (factoryParamId: number) => void;
  onParameterControl: (factoryId: number) => void;
  onImageModal: (images: string[], index: number) => void;
}

const ProjectGrid: React.FC<ProjectGridProps> = ({
  factories,
  onEditProject,
  onDeleteProject,
  onParameterUpdate,
  onShowHistory,
  onParameterControl,
  onImageModal,
}) => {
  return (
    <div id="factory-data-wrapper" className="mt-5 grid grid-cols-12 gap-6">
      {factories.map((factory) => (
        <ProjectCard
          key={factory.id}
          factory={factory}
          onEdit={onEditProject}
          onDelete={onDeleteProject}
          onParameterUpdate={onParameterUpdate}
          onShowHistory={onShowHistory}
          onParameterControl={onParameterControl}
          onImageModal={onImageModal}
        />
      ))}
    </div>
  );
};

export default ProjectGrid;
