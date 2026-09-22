import ProjectForm from "@/components/admin/ProjectForm";

export default function NewProjectPage() {
  return (
    <div>
      <h1 className="font-display text-3xl uppercase leading-none text-ink">New project</h1>
      <p className="mt-2 font-body text-sm text-muted">
        It saves as a draft unless you set it to published. Gallery images can be
        added once it exists.
      </p>
      <ProjectForm />
    </div>
  );
}
