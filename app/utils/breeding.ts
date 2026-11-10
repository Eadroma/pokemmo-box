// PokeMMO breeding: each parent passes one attribute through its held item (Brace for an IV, Everstone
// for the nature). IVs both parents share are passed anyway; the nature is not, so it must always be
// item-passed: keep it last so it only ever travels down the right branch.

export interface BreedNode { attrs: string[], left?: BreedNode, right?: BreedNode }

export function breedTree(attrs: string[]): BreedNode {
  if (attrs.length <= 1) return { attrs }
  return {
    attrs,
    left: breedTree(attrs.slice(0, -1)),
    right: breedTree([...attrs.slice(0, -2), attrs.at(-1)!]),
  }
}

export function breedSummary(attrs: string[]) {
  const leaves: Record<string, number> = {}
  let breeds = 0
  const walk = (n: BreedNode) => {
    if (!n.left) {
      leaves[n.attrs[0]!] = (leaves[n.attrs[0]!] ?? 0) + 1
      return
    }
    breeds++
    walk(n.left)
    walk(n.right!)
  }
  walk(breedTree(attrs))
  const everstones = attrs.includes('nature') ? attrs.length - 1 : 0 // one per breed on the nature branch
  return { leaves, parents: Object.values(leaves).reduce((a, b) => a + b, 0), breeds, everstones, braces: breeds * 2 - everstones }
}

// Egg groups (French, as exported): Ditto breeds with anything that can breed; "ne peuvent pas…" never breeds.
const DITTO = 'métamorph', NO_EGGS = 'ne peuvent pas se reproduire'
export const canBreed = (target: string[], parent: string[]) =>
  !target.includes(NO_EGGS) && !parent.includes(NO_EGGS) && !target.includes(DITTO)
  && (parent.includes(DITTO) || parent.some(g => target.includes(g)))

// Fills the breeding tree from what you own, top-down: a mon that already has every attribute of a node
// replaces that whole sub-tree. `pool` is tried in order (put the mons you'd rather spend first).
// shortcut: ignores gender (each breed needs one male + one female or Ditto); upgrade when the export's gender is used.
export function coverTree<T>(root: BreedNode, pool: T[], has: (m: T, attr: string) => boolean) {
  const used = new Set<T>()
  const cover = new Map<BreedNode, T>()
  const queue = root.left ? [root.left, root.right!] : []
  while (queue.length) {
    const n = queue.shift()!
    const m = pool.find(x => !used.has(x) && n.attrs.every(a => has(x, a)))
    if (m) {
      cover.set(n, m)
      used.add(m)
    }
    else if (n.left) queue.push(n.left, n.right!)
  }
  // Base parents still to catch or buy: leaves not covered and not under a covered node.
  let missing = 0
  const walk = (n: BreedNode) => {
    if (cover.has(n)) return
    if (!n.left) missing++
    else {
      walk(n.left)
      walk(n.right!)
    }
  }
  if (root.left) walk(root)
  return { cover, missing }
}
