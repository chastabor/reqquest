<script lang="ts">
  import DocumentSetDisplay from "../_templates/DocumentSetDisplay.svelte"
  export let data: any
</script>

<DocumentSetDisplay {data} documents={[{ path: "letter", label: "Recommendation Letter" }]} />
