<script lang="ts">
  import DocumentSet from "../_templates/DocumentSet.svelte"
  export let data: any
</script>

<DocumentSet {data} documents={[{ path: "distemperDoc", label: "Proof of Distemper Vaccine" }, { path: "rabiesDoc", label: "Proof of Rabies Vaccine" }, { path: "felineLeukemiaDoc", label: "Proof of Feline Leukemia Vaccine" }, { path: "felineHIVDoc", label: "Proof of Feline HIV Vaccine" }]} />
