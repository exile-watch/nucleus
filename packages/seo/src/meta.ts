import {DefaultSeoProps} from "next-seo";

const Meta: DefaultSeoProps = {
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://exile.watch/',
    siteName: 'exile.watch',
  },
}

const MetaHomepage = {
  title: "exile.watch: Master Path of Exile with Visual Ability Insights - Quick, Informative GIFs",
  description: "Master Path of Exile with exile.watch: Streamline your game with our quick visual guides and GIFs."
}

const MetaWelcome = {
  title: `Welcome`,
  description: "Welcome to your Path of Exile edge with exile.watch: Dive into swift, visual ability insights and GIFs for smarter gameplay."
}

const MetaDirectory = {
  title: `Directory`,
  description: ({directory}) => `Advance your ${directory} gameplay with exile.watch: Discover visual ability insights and GIFs designed to conquer new challenges.`,
}

const MetaEncounters = ({directory}) => ({
  title: `${directory} Encounters`,
  encounters: `Navigate ${directory} encounters with ease on exile.watch: Access a curated list of encounter categories for targeted visual ability insights.`
})

const MetaEncounterCategories = ({directory, category}) => ({
  title: `${category} - ${directory} Encounters`,
  encounters: `Master the ${category} encounters in ${directory} with exile.watch: Visual ability insights and GIFs to conquer the Atlas's toughest foes.`
})

const MetaEncounter = ({directory, category, encounter}) => ({
  title: `${encounter} - ${category}, ${directory} Encounters`,
  encounters: `Understand and conquer ${encounter} in ${directory} with exile.watch: Discover key abilities and their effects through our concise, informative GIFs.`
})

export {
  Meta,
  MetaHomepage,
  MetaWelcome,
  MetaDirectory,
  MetaEncounters,
  MetaEncounterCategories
}