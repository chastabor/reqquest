<!--
  DocumentSetDisplay — read-only counterpart to DocumentSet. Lists each
  expected document's filename and KB size, or "No document uploaded" if
  the path is empty.
-->
<script lang="ts">
  export let data: Record<string, any> = {}
  export let documents: { path: string, label: string }[] = []
</script>

<dl>
  {#each documents as doc (doc.path)}
    <dt>{doc.label}</dt>
    {#if data?.[doc.path]}
      <dd>{data[doc.path].name} ({Math.round(data[doc.path].size / 1024)} KB)</dd>
    {:else}
      <dd>No document uploaded.</dd>
    {/if}
  {/each}
</dl>
