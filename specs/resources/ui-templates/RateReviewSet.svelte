<!--
  RateReviewSet — reviewer-side companion that renders, for each named
  item, a `FieldSelect` over a fetched value/label list. Each select writes
  the chosen value to `<path>.rating` and (when the selected option has a
  label) mirrors the human-readable label into `<path>.ratingName` via
  `FieldHidden` — the multi-item analogue of `SelectValueLabel`.

  Spec usage:
    ui:
      form:
        template: RateReviewSet
        props:
          listKey: ratingLevels5     # key in the prompt's `fetched` object
          required: true
          items:
            - { path: distemper, label: "Distemper recommendation rating" }
            - { path: rabies,    label: "Rabies recommendation rating" }

  The prompt's `fetch:` hook must populate `fetched[listKey]` with an
  array of `{ value, label }`. The model schema must declare each item
  as `{ rating, ratingName }`.
-->
<script lang="ts">
  import { FieldHidden, FieldSelect } from '@txstate-mws/carbon-svelte'

  export let data: Record<string, any> = {}
  export let fetched: Record<string, { value: string, label: string }[]> = {}

  export let items: { path: string, label: string }[] = []
  export let listKey: string = 'list'
  export let required: boolean = false

  $: list = fetched?.[listKey] ?? []
</script>

{#each items as item (item.path)}
  {@const mirrorLabel = list.find(s => s.value === data?.[item.path]?.rating)?.label}
  <FieldSelect path="{item.path}.rating" labelText={item.label} {required} items={list} />
  {#if mirrorLabel != null}
    <FieldHidden path="{item.path}.ratingName" value={mirrorLabel} />
  {/if}
{/each}
