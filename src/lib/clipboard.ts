
/**
 * Tries to copy text to the clipboard using modern and legacy APIs.
 * Returns true if successful, false otherwise.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    // Tier 1: Modern navigator.clipboard API
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.warn("Modern clipboard API failed, trying fallback...", err);
        }
    }

    // Tier 2: Legacy execCommand('copy') fallback
    try {
        const textArea = document.createElement("textarea");
        textArea.value = text;

        // Ensure the textarea is off-screen
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);

        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        return successful;
    } catch (err) {
        console.error("Legacy clipboard fallback failed:", err);
        return false;
    }
}
