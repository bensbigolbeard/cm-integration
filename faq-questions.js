const CATEGORIES = {
  WEN: "Wen",
  DROPS: "Drops",
  ACCESS: "Access",
};
const FAQs = [
  {
    name: "Wen shipping?",
    category: CATEGORIES.WEN,
    value:
      "Unwelcome Packs are expected to ship in late April! They contain essential items for your daily activities, including personal hygiene and cleaning supplies. We urge you to utilize these items responsibly and maintain a clean and orderly living space.",
  },
  {
    name: "Is there any point in hodling Crime Reports?",
    category: CATEGORIES.DROPS,
    value:
      "No, beyond pure price speculation. You can't stay on the run *and* hang out with everyone in the clink.",
  },
  {
    name: "I have a Cel Mate, now what?",
    category: CATEGORIES.ACCESS,
    value:
      "If you haven't already, fill out your #paperwork to get full access to the rest of the server. You can also start accumulating Steaks, by putting them on Death Row (#clink-links), which will be required for all future drops in the Hanging Hall.",
  },
  {
    name: "What's the Hanging Hall?",
    category: CATEGORIES.ACCESS,
    value:
      "It's where all future Cel Mate art collabs will be raffled and/or sold. Mcbess also releases solo works here, directly to the community, including new editions of his best known collection, Les Ladies.",
  },
];

module.exports = { FAQs, CATEGORIES };
