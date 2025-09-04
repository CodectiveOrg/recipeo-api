export type SpoonacularRecipeType = {
  id: number;
  title: string;
  image: string;
  imageType: string;
  servings: number;
  readyInMinutes: number;
  cookingMinutes: number;
  preparationMinutes: number;
  license: string;
  sourceName: string;
  sourceUrl: string;
  spoonacularSourceUrl: string;
  healthScore: number;
  spoonacularScore: number;
  pricePerServing: number;
  cheap: boolean;
  creditsText: string;
  dairyFree: boolean;
  gaps: string;
  glutenFree: boolean;
  instructions: string;
  analyzedInstructions: AnalyzedInstructions[];
  ketogenic: boolean;
  lowFodmap: boolean;
  sustainable: boolean;
  vegan: boolean;
  vegetarian: boolean;
  veryHealthy: boolean;
  veryPopular: boolean;
  whole30: boolean;
  weightWatcherSmartPoints: number;
  dishTypes: string[];
  extendedIngredients: ExtendedIngredients[];
  summary: string;
  winePairing: WinePairing;
};

type WinePairing = {
  pairedWines: string[];
  pairingText: string;
  productMatches: ProductMatches[];
};

type ProductMatches = {
  id: number;
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  averageRating: number;
  ratingCount: number;
  score: number;
  link: string;
};

type AnalyzedInstructions = {
  name: string;
  steps: Steps[];
};

type Steps = {
  number: number;
  step: string;
  ingredients: Ingredients[];
  equipment: Equipment[];
  length: Length;
};

type Length = {
  number: number;
  unit: string;
};

type Ingredients = {
  id: number;
  name: string;
  localizedName: string;
  image: string;
};

type Equipment = {
  id: number;
  name: string;
  localizedName: string;
  image: string;
};

type ExtendedIngredients = {
  aisle: string;
  amount: number;
  consistency: string;
  id: number;
  image: string;
  measures: Measures;
  name: string;
  original: string;
  originalName: string;
  unit: string;
};

type Measures = {
  metric: Metric;
  us: Us;
};

type Metric = {
  amount: number;
  unitLong: string;
  unitShort: string;
};

type Us = {
  amount: number;
  unitLong: string;
  unitShort: string;
};
