const GeV_to_MeV = 1000;

function convertGeVToMeV(energyGeV, decimals = 2) {
    if (energyGeV === null || energyGeV === undefined || energyGeV === '') {
        return '0.00';
    }
    const energy = parseFloat(energyGeV);
    if (isNaN(energy)) {
        return '0.00';
    }
    return (energy * GeV_to_MeV).toFixed(decimals);
}

function formatEnergyMeV(energyGeV, decimals = 2) {
    const energyMeV = convertGeVToMeV(energyGeV, decimals);
    return `${energyMeV} MeV`;
}

window.energyUtils = {
    convertGeVToMeV,
    formatEnergyMeV,
    GeV_to_MeV
};