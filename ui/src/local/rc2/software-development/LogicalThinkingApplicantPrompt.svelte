<script lang="ts">
  import DocumentSet from "../_templates/DocumentSet.svelte"
  export let data: any
</script>

<DocumentSet {data} documents={[{ path: "documentation", label: "Supporting pseudocode documentation.", textInput: { path: "solution", labelText: "Please enter solution." } }]} />
