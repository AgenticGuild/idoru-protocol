use rand::Rng;

#[derive(Clone)]
pub struct Agent {
    pub id: String,
    pub resonance: f64,
}

impl Agent {
    pub fn new(id: &str) -> Self {
        Self { 
            id: id.to_string(), 
            resonance: 1.0 
        }
    }

    pub fn run_simulation(&mut self) {
        // HPC placeholder: do a random update
        let mut rng = rand::thread_rng();
        // e.g., random "performance" factor
        let perf = rng.gen_range(0.8..1.2);
        self.resonance *= perf;
        // Clip at max 100.0 for simplicity
        if self.resonance > 100.0 {
            self.resonance = 100.0;
        }
    }
} 