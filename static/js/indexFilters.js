function setupIndexFilters() {
    const filterInteraction = document.getElementById('filter-interaction');
    const filterFlavor = document.getElementById('filter-flavor');
    const filterMode = document.getElementById('filter-mode');
    const imageCount = document.getElementById('image-count');

    function handleStartButton() {
        const interaction = filterInteraction.checked;
        const flavor = filterFlavor.checked;
        const mode = filterMode.checked;
        const particles = document.getElementById('filter-particles').checked;
        const count = imageCount.value;
        const timestamp = Date.now();

        window.location.href = `/exercise.html?interaction=${interaction}&flavor=${flavor}&mode=${mode}&particles=${particles}&count=${count}&_=${timestamp}`;
    }

    function handleLearnButton() {
        const timestamp = Date.now();
        window.location.href = `/learn.html?_=${timestamp}`;
    }

    document.getElementById('start-btn').addEventListener('click', handleStartButton);
    document.getElementById('learn-btn').addEventListener('click', handleLearnButton);
}

document.addEventListener('DOMContentLoaded', setupIndexFilters);