<script lang="ts">
  import DocumentSet from "../_templates/DocumentSet.svelte"
  export let data: any
</script>

<DocumentSet {data} documents={[{ path: "letter", label: "Faculty Recommendation Letter" }]} />
