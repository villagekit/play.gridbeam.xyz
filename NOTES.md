store stack of previous and next commands

execute (command)

startTransient () => id
executeInTransient (id, command)
endTransient (id)

hooks

useCommander

commands
- createPart()
- movePart()
- transient: { uuid, origin }
- enduring

new store
- single zustand store
- many "dino" stores

- name
- actions (set) => ({
   action: (...args) => set(state => {
     state.key = value
   })
 })
- selectors: {
   select: [
     name,
     (...values) => selection
   ]
- effects: {
   react: [
     name,
     (...values) => action(...args) | null
   ]
 }
