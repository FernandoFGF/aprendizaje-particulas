function setupIndexFilters() {
    const filterInteraction = document.getElementById('filter-interaction');
    const filterFlavor = document.getElementById('filter-flavor');
    const filterMode = document.getElementById('filter-mode');
    const imageCount = document.getElementById('image-count');

    function handleStartButton() {
        const interaction = filterInteraction.checked;
        const flavor = filterFlavor.checked;
        const mode = filterMode.checked;
        const count = imageCount.value;
        const timestamp = Date.now();

        window.location.href = `/exercise.html?interaction=${interaction}&flavor=${flavor}&mode=${mode}&count=${count}&_=${timestamp}`;
    }

    document.getElementById('start-btn').addEventListener('click', handleStartButton);
}

document.addEventListener('DOMContentLoaded', setupIndexFilters);