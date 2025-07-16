function setupIndexFilters() {
    const filterInteraction = document.getElementById('filter-interaction');
    const filterFlavor = document.getElementById('filter-flavor');
    const filterMode = document.getElementById('filter-mode');

    function handleStartButton() {
        const interaction = filterInteraction.checked;
        const flavor = filterFlavor.checked;
        const mode = filterMode.checked;
        window.location.href = `/exercise.html?interaction=${interaction}&flavor=${flavor}&mode=${mode}`;
    }

    document.getElementById('start-btn').addEventListener('click', handleStartButton);
}

document.addEventListener('DOMContentLoaded', setupIndexFilters);