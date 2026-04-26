<!--
  DocumentSet — render a labeled set of `FieldUpload` controls bound to
  named paths on the prompt's data object. Pairs with DocumentSetDisplay
  for the read-only side.

  Spec usage:
    ui:
      form:
        template: DocumentSet
        props:
          documents:
            - { path: distemperDoc,      label: "Proof of Distemper Vaccine" }
            - { path: rabiesDoc,         label: "Proof of Rabies Vaccine" }
            - { path: felineLeukemiaDoc, label: "Proof of Feline Leukemia Vaccine" }
            - { path: felineHIVDoc,      label: "Proof of Feline HIV Vaccine" }

  Size limits and content-type filtering are enforced server-side via the
  prompt's preValidate hook (see logic/<group>.logic.ts).
-->
<script lang="ts">
  import { FieldUpload } from '@txstate-mws/carbon-svelte'

  export let documents: { path: string, label: string, accept?: string }[] = []
</script>

{#each documents as doc (doc.path)}
  <FieldUpload path={doc.path} labelText={doc.label} accept={doc.accept} />
{/each}
