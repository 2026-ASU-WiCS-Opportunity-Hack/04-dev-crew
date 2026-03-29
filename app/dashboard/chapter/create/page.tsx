import { CreateChapterForm } from "@/components/chapter/CreateChapterForm";

export default function CreateChapterPage() {
  return (
    <div>
      <h1 className="section-title" style={{ marginBottom: "1.5rem" }}>Create New Chapter</h1>
      <p className="section-copy" style={{ marginBottom: "1.5rem" }}>
        Fill in the chapter details below. Optionally provide extra context and
        click &ldquo;Generate with AI&rdquo; to auto-create culturally-adapted page
        content.
      </p>
      <CreateChapterForm />
    </div>
  );
}
