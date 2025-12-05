import { ObjectItem } from "@/types";

const descriptions = [
  "A worn leather wallet, its surface cracked like parched earth. The brass clasp still clicks with quiet authority.",
  "Ceramic mug, glazed in ocean blue. A hairline fracture runs along the rim—evidence of one too many mornings.",
  "Cotton t-shirt, faded to the color of old newsprint. The collar retains the ghost of countless washes.",
  "Hardcover novel, spine broken at chapter seven. Dog-eared pages mark moments of interrupted reading.",
  "Brass key ring, heavy with forgotten doors. Each key a small mystery, purpose long since abandoned.",
  "Glass vase, emerald green, catching light like a held breath. Empty now, but remembering flowers.",
  "Wool scarf, hand-knitted in uneven rows. The yarn still carries the warmth of its making.",
  "Leather belt, notched at the third hole. The buckle bears the patina of daily ritual.",
  "Porcelain figurine, a dancer frozen mid-pirouette. One arm slightly chipped, still graceful.",
  "Canvas tote bag, stained with grocery store adventures. The handles have molded to familiar hands.",
  "Silver watch, stopped at 3:47. The face peers out from beneath scratched crystal like a preserved memory.",
  "Wooden picture frame, empty. The backing still holds the indentation of a photograph removed.",
  "Silk tie, deep burgundy with subtle stripe. Rolled precisely, awaiting occasions that rarely come.",
  "Coffee grinder, hand-cranked, the mechanism singing with each rotation. Grounds still dust the burrs.",
  "Leather journal, pages blank past the first twenty. The binding cracks with potential.",
  "Cast iron skillet, seasoned black as coal. Generations of meals live in its surface.",
  "Vintage lamp, art deco curves. The switch makes a satisfying click, though the bulb is gone.",
  "Straw hat, summer-bleached, brim curled from salt air. It remembers beaches.",
  "Glass paperweight, containing a frozen dandelion. Wishes suspended in crystal clarity.",
  "Wooden chess piece, a lone knight. Dark squares stained into its base from years of service.",
  "Ceramic planter, terracotta, white salt deposits mapping its surface like continents.",
  "Vinyl record, sleeve soft with handling. The grooves hold music waiting to be released.",
  "Brass compass, needle trembling north. The case worn smooth by pocket-dwelling.",
  "Cotton handkerchief, monogrammed in fading thread. The initials of someone loved.",
  "Leather-bound dictionary, pages tissue-thin. Words upon words, each one a small world.",
];

const colors = [
  "#E8D5B7", // warm beige
  "#7B9E87", // sage green
  "#C4A484", // tan leather
  "#8B7355", // coffee brown
  "#D4A574", // caramel
  "#9DB4C0", // dusty blue
  "#C9B1A0", // taupe
  "#A67B5B", // bronze
  "#E6D8C3", // cream
  "#8B8589", // warm gray
  "#B8860B", // dark goldenrod
  "#CD853F", // peru
  "#DEB887", // burlywood
  "#D2691E", // chocolate
  "#BC8F8F", // rosy brown
  "#F4A460", // sandy brown
  "#DAA520", // goldenrod
  "#B8B8B8", // silver
  "#C0C0C0", // light silver
  "#A0522D", // sienna
  "#808080", // gray
  "#696969", // dim gray
  "#778899", // light slate gray
  "#708090", // slate gray
  "#2F4F4F", // dark slate gray
];

export const mockObjects: ObjectItem[] = descriptions.map((description, i) => ({
  id: `obj-${i + 1}`,
  color: colors[i % colors.length],
  description,
  status: "active",
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
  updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
}));
