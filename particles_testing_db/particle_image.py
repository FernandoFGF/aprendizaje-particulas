class Particle:
    def __init__(self, id=None, image_path=None, interaction_type=None, flavor=None, interaction_mode=None, neutrino_energy=None):
        self.id = id
        self.image_path = image_path
        self.interaction_type = interaction_type
        self.flavor = flavor
        self.interaction_mode = interaction_mode
        self.neutrino_energy = neutrino_energy

    def __str__(self):
        return (f'Id: {self.id}, Path: {self.image_path}, '
                f'Tipo interacción: {self.interaction_type}, Sabor: {self.flavor}, '
                f'Modo interacción: {self.interaction_mode}, '
                f'Energía neutrino: {self.neutrino_energy}')

    @property
    def interaction_type_str(self):
        return 'CC' if self.interaction_type == 0 else 'NC'

    @property
    def flavor_str(self):
        return {12: 'Electrón', 14: 'Muon', 16: 'Tau'}.get(self.flavor, 'Desconocido')

    @property
    def interaction_mode_str(self):
        return {
            0: 'QE',
            1: 'RES',
            2: 'DIS',
            3: 'COH',
            10: 'MEC'
        }.get(self.interaction_mode, 'Desconocido')