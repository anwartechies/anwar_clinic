import { apiBlob } from "@/lib/api";

/**
 * Opens an applicant's CV. CVs are private in storage, so there's no link to
 * follow: the file is fetched with the staff member's session and shown from an
 * in-memory object URL. The tab is opened synchronously inside the click so
 * popup blockers allow it, then pointed at the file once it has downloaded.
 */
export async function openResume(applicationId: string, fileName: string) {
  const tab = window.open("", "_blank");
  try {
    const blob = await apiBlob(`/jobs/admin/applications/${applicationId}/resume`);
    const url = URL.createObjectURL(blob);
    if (tab) {
      tab.location.href = url;
    } else {
      // Popup blocked anyway — fall back to a download.
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "resume";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    // Give the tab time to load it before releasing the memory.
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (err: unknown) {
    tab?.close();
    alert(err instanceof Error ? err.message : "Could not open the resume");
  }
}
