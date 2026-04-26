<script lang="ts">
  import DocumentSetDisplay from "../_templates/DocumentSetDisplay.svelte"
  export let data: any
</script>

<DocumentSetDisplay {data} documents={[{ path: "distemperDoc", label: "Distemper" }, { path: "rabiesDoc", label: "Rabies" }, { path: "felineLeukemiaDoc", label: "Feline Leukemia" }, { path: "felineHIVDoc", label: "Feline HIV" }]} />
