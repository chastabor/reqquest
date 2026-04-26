<!--
  LabeledFields — render a `<dl>` of label/value rows from the prompt's
  data. Read-only; pairs naturally with field-shorthand forms.

  Spec usage:
    display:
      template: LabeledFields
      props:
        entries:
          - { path: squareFootage, label: "Square Footage" }
          - { path: totalPets,     label: "Total Pets" }

  Each `entry.path` is validated against the prompt's model schema. Use
  inside a `cases:` branch (SPECS.md §8 Shape C) when the readout should
  be conditional.
-->
<script lang="ts">
  export let data: Record<string, any> = {}
  export let entries: { path: string, label: string }[] = []
</script>

<dl>
  {#each entries as entry (entry.path)}
    <dt>{entry.label}</dt>
    <dd>{data?.[entry.path] ?? ''}</dd>
  {/each}
</dl>
