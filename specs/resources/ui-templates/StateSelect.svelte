<!--
  StateSelect — `FieldSelect` over a fetched value/label list, with a
  companion `FieldHidden` that mirrors the selected label into a paired
  `<labelPath>` field. Useful when the schema stores both an enum code
  ("TX") and the human-readable name ("Texas"), e.g. for downstream
  display without re-resolving the lookup.

  Spec usage:
    ui:
      form:
        template: StateSelect
        props:
          path: state                 # value path
          labelPath: stateName        # mirror path (optional)
          labelText: "State"
          required: true
          listKey: stateList          # key in the prompt's `fetched` object

  The prompt's `fetch:` hook must populate `fetched[listKey]` with an
  array of `{ value, label }`.
-->
<script lang="ts">
  import { FieldHidden, FieldSelect } from '@txstate-mws/carbon-svelte'

  export let data: Record<string, any>
  export let fetched: Record<string, { value: string, label: string }[]> = {}

  export let path: string
  export let labelPath: string | undefined = undefined
  export let labelText: string = ''
  export let required: boolean = false
  export let listKey: string = 'list'

  $: list = fetched?.[listKey] ?? []
  $: mirrorLabel = labelPath != null ? list.find(s => s.value === data?.[path])?.label : undefined
</script>

<FieldSelect {path} {labelText} {required} items={list} />

{#if labelPath != null && mirrorLabel != null}
  <FieldHidden path={labelPath} value={mirrorLabel} />
{/if}
