import { notFound } from "next/navigation";
import GalleryManager from "@/components/admin/GalleryManager";
import ProjectForm from "@/components/admin/ProjectForm";
import DeleteProjectButton from "@/components/admin/DeleteProjectButton";
import { getProjectById, getProjectImages } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const project = await getProjectById(params.id);
  if (!project) notFound();

  const images = await getProjectImages(project.id);

  return (
    <div>
      <h1 className="font-display text-3xl uppercase leading-none text-ink">Edit project</h1>
      <p className="mt-2 font-body text-sm text-muted">{project.title}</p>

      <ProjectForm project={project} />

      <GalleryManager projectId={project.id} images={images} />

      <div className="mt-10 max-w-xl border-t border-line pt-8">
        <h2 className="font-display text-lg uppercase leading-none text-ink">Delete</h2>
        <p className="mt-2 font-body text-sm text-muted">
          Removes this project and its gallery images. This can&apos;t be undone.
        </p>
        <div className="mt-4">
          <DeleteProjectButton projectId={project.id} />
        </div>
      </div>
    </div>
  );
}
