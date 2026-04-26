<script lang="ts">
  import { FieldSelect } from '@txstate-mws/carbon-svelte'
  export let data: any
  export let fetched: any
</script>

<FieldSelect path="residentOfState" labelText="State" required items={fetched.stateList} />
