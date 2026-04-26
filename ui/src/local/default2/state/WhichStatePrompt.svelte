<script lang="ts">
  import StateSelect from "../_templates/StateSelect.svelte"
  export let data: any
  export let fetched: any
</script>

<StateSelect {data} {fetched} path="state" labelPath="stateName" labelText="State" required listKey="stateList" />
