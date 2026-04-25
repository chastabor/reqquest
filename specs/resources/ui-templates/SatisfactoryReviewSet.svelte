<!--
  SatisfactoryReviewSet — reviewer-side companion to DocumentSet. For each
  named item, render a yes/no FieldRadio that writes to `<path>.satisfactory`.

  Spec usage:
    ui:
      form:
        template: SatisfactoryReviewSet
        props:
          items:
            - { path: distemper,      label: "Is the proof of distemper vaccination satisfactory?" }
            - { path: rabies,         label: "Is the proof of rabies vaccination satisfactory?" }
            - { path: felineLeukemia, label: "Is the proof of feline leukemia vaccination satisfactory?" }
            - { path: felineHIV,      label: "Is the proof of feline HIV vaccination satisfactory?" }

  The model schema must declare each item as `{ satisfactory: boolean }`.
-->
<script lang="ts">
  import { FieldRadio } from '@txstate-mws/carbon-svelte'

  export let items: { path: string, label: string }[] = []

  const noFirstItems = [
    { value: false, label: 'No' },
    { value: true,  label: 'Yes' }
  ]
</script>

{#each items as item (item.path)}
  <FieldRadio boolean path="{item.path}.satisfactory" labelText={item.label} items={noFirstItems} />
{/each}
