<!--
  BooleanSummary — display-only template.

  Renders one of three strings depending on whether `data[path]` (a boolean
  path on the prompt's data object) is true, false, or null/undefined.

  Spec usage:
    display:
      template: BooleanSummary
      props:
        path: haveCatTower
        yes:    "Already owns a cat tower."
        no:     "No cat tower."
        unset:  "Cat tower status not yet provided."

  Path supports simple dot-paths ("foo.bar") so it can drill into nested
  objects (e.g. `distemper.satisfactory`).
-->
<script lang="ts">
  export let data: Record<string, any>
  export let path: string
  export let yes: string = ''
  export let no: string = ''
  export let unset: string = ''

  function read (obj: any, p: string): any {
    return p.split('.').reduce((acc, key) => acc == null ? acc : acc[key], obj)
  }

  $: value = read(data, path)
</script>

{#if value === true}
  {yes}
{:else if value === false}
  {no}
{:else if unset}
  {unset}
{/if}
