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
  "Copper kettle, verdigris creeping up the spout. It still whistles, though softer now.",
  "Woolen blanket, moth-eaten at one corner. The weave holds decades of winter evenings.",
  "Plastic snow globe, water clouded with age. The Eiffel Tower stands eternal within.",
  "Wooden spoon, handle darkened by oils. Stirred countless soups into existence.",
  "Brass door knocker, lion-headed, green with neglect. Waiting for visitors who don't come.",
  "Wicker basket, weave loosened by use. It carried fruit, laundry, secrets.",
  "Porcelain teacup, gold rim worn to silver. The interior stained the color of memory.",
  "Leather gloves, right hand more worn than left. Shaped to one person's gestures.",
  "Crystal decanter, stopper frozen in place. The glass remembers whiskey.",
  "Wooden cutting board, knife-scarred in cross-hatch patterns. A map of meals prepared.",
  "Ceramic soap dish, cracked but functional. Pink residue lines its shallow bowl.",
  "Brass candlestick, wax drippings frozen mid-flow. It held light for intimate dinners.",
  "Canvas sneakers, soles worn thin at the ball. Miles of pavement remembered in rubber.",
  "Glass jar, once held honey, now only sticky residue. Bees' labor preserved in absence.",
  "Wooden ruler, inches faded to ghosts. It measured children's growth spurts.",
  "Silk pocket square, pressed into perfect folds. Waiting in a drawer for elegance.",
  "Ceramic butter dish, lid slightly ajar. The inside still smells of Sunday mornings.",
  "Leather briefcase, corners scuffed to suede. It commuted to jobs long since quit.",
  "Glass marbles, colors swirled in frozen motion. Childhood games captured in spheres.",
  "Wooden coat hanger, shoulders curved from heavy coats. It holds shape even when empty.",
  "Brass letter opener, blade dulled from envelopes. Communication in a physical age.",
  "Cotton napkins, embroidered corners unraveling. Holiday meals woven into cloth.",
  "Ceramic vase, neck too narrow for bouquets. A single stem fits perfectly.",
  "Leather passport holder, stamps faded within. Borders crossed, adventures archived.",
  "Glass perfume bottle, atomizer dry. The scent lingers in imagination only.",
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

export const mockObjects: ObjectItem[] = descriptions.map((description, i) => {
  const color = colors[i % colors.length];
  // Use color as placeholder image background for mock data
  const placeholderUrl = `https://placehold.co/400x400/${color.slice(1)}/white?text=`;
  return {
    id: `obj-${i + 1}`,
    originalImageUrl: placeholderUrl,
    transformedImageUrl: placeholderUrl,
    description,
    status: "active" as const,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
  };
});
