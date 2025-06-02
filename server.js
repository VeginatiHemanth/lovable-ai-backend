// script.js

// Grab DOM elements
const generateBtn = document.getElementById("generate-btn");
const downloadBtn = document.getElementById("download-zip");
const userPromptEl = document.getElementById("user-prompt");
const previewIframe = document.getElementById("preview-iframe");

let lastFullResponse = ""; // Will hold the entire multi-file response

// Helper: Extract the <iframe> content (index.html) from the AI response
function extractIndexHTML(fullText) {
  const marker = "<!-- File: index.html";
  const start = fullText.indexOf(marker);
  if (start === -1) return null;

  // Find where the next file begins
  const nextMarker = fullText.indexOf("<!-- File:", start + marker.length);
  if (nextMarker !== -1) {
    return fullText.slice(start + marker.length, nextMarker).trim();
  } else {
    // If no next marker, take everything after index.html marker
    return fullText.slice(start + marker.length).trim();
  }
}

// On click: Generate Final Page
generateBtn.addEventListener("click", async () => {
  const prompt = userPromptEl.value.trim();
  if (!prompt) {
    alert("Please enter a prompt before generating.");
    return;
  }

  // Disable buttons while fetching
  generateBtn.disabled = true;
  generateBtn.textContent = "Generating…";
  downloadBtn.disabled = true;

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Server error:", err);
      alert("Error generating website: " + (err.error || response.statusText));
      generateBtn.disabled = false;
      generateBtn.textContent = "Generate Final Page";
      return;
    }

    const data = await response.json();
    const fullText = data.html || "";
    lastFullResponse = fullText;

    // Extract index.html portion and embed in iframe
    const indexHTML = extractIndexHTML(fullText);
    if (!indexHTML) {
      previewIframe.srcdoc = "<p style='padding:1rem;'>Unable to extract index.html from AI response.</p>";
    } else {
      // Escape quotes properly for srcdoc
      previewIframe.srcdoc = indexHTML.replace(/<\/script>/gi, "<\\/script>");
    }

    // Re-enable Download ZIP button
    downloadBtn.disabled = false;
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate Final Page";
  } catch (err) {
    console.error("Fetch error:", err);
    alert("Network or server error. Check console for details.");
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate Final Page";
  }
});

// On click: Download ZIP (all files from the AI response)
downloadBtn.addEventListener("click", () => {
  if (!lastFullResponse) {
    alert("Please generate the site first.");
    return;
  }

  // Split on each "<!-- File: <filename> -->" marker
  // We use a regex to capture the filename and the content after it
  const parts = lastFullResponse.split(/<!-- File:\s*(.+?)\s*-->/).filter(s => s.trim());

  // 'parts' is an array like:
  // [ "index.html", "<!DOCTYPE html>…</html>", "css/styles.css", "/* ... */", "js/main.js", "// ...", "menu.html", "<!DOCTYPE html>…</html>", ... ]
  const zip = new JSZip();

  for (let i = 0; i < parts.length; i += 2) {
    const filename = parts[i].trim();
    const content = parts[i + 1].trim();
    zip.file(filename, content);
  }

  zip.generateAsync({ type: "blob" }).then((blob) => {
    saveAs(blob, "restaurant-site.zip");
  });
});
