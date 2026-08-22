import advancedFacials from "@/assets/services/advanced-facials.jpg.asset.json";
import bioStimulators from "@/assets/services/bio-stimulators.jpg.asset.json";
import botox from "@/assets/services/botox.jpg.asset.json";
import carbonLaser from "@/assets/services/carbon-laser.jpg.asset.json";
import chemicalPeels from "@/assets/services/chemical-peels.jpg.asset.json";
import dermaPlaning from "@/assets/services/derma-planing.jpg.asset.json";
import dermalFillers from "@/assets/services/dermal-fillers.jpg.asset.json";
import exosomeTherapy from "@/assets/services/exosome-therapy.jpg.asset.json";
import hifu from "@/assets/services/hifu.jpg.asset.json";
import ipl from "@/assets/services/ipl.jpg.asset.json";
import ivDrips from "@/assets/services/iv-drips.jpg.asset.json";
import laserHairReduction from "@/assets/services/laser-hair-reduction.jpg.asset.json";
import laserResurfacing from "@/assets/services/laser-resurfacing.jpg.asset.json";
import microNeedling from "@/assets/services/micro-needling.jpg.asset.json";
import radioFrequency from "@/assets/services/radio-frequency.jpg.asset.json";
import rfMicroNeedling from "@/assets/services/rf-micro-needling.jpg.asset.json";
import scalpMesotherapy from "@/assets/services/scalp-mesotherapy.jpg.asset.json";
import skinBoosters from "@/assets/services/skin-boosters.jpg.asset.json";
import threadLifts from "@/assets/services/thread-lifts.jpg.asset.json";

export const SERVICE_IMAGES: Record<string, string> = {
  "Medical Grade Chemical Peels": chemicalPeels.url,
  "Micro Needling": microNeedling.url,
  "Laser Skin Resurfacing": laserResurfacing.url,
  "Intense Pulsed Light": ipl.url,
  "Advanced Facials": advancedFacials.url,
  "Derma Planing": dermaPlaning.url,
  "High Intensity Focused Ultrasound (HIFU)": hifu.url,
  "Radio Frequency": radioFrequency.url,
  "RF Micro Needling": rfMicroNeedling.url,
  "Thread Lifts": threadLifts.url,
  "Exosome Therapy": exosomeTherapy.url,
  "Scalp Micro Needling & Hair Mesotherapy": scalpMesotherapy.url,
  "Skin & Wellness Drips": ivDrips.url,
  Botox: botox.url,
  "Dermal Fillers": dermalFillers.url,
  "Bio Stimulators": bioStimulators.url,
  "Skin Boosters": skinBoosters.url,
  "Carbon Laser": carbonLaser.url,
  "Laser Hair Reduction": laserHairReduction.url,
};

export const CATEGORY_COVERS: Record<string, string> = {
  "skin-rejuvenation": advancedFacials.url,
  "skin-tightening": hifu.url,
  "hair-regenerative": exosomeTherapy.url,
  "iv-nutrient-infusions": ivDrips.url,
  injectables: dermalFillers.url,
  lasers: carbonLaser.url,
};
