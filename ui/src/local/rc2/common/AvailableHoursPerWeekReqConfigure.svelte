<script lang="ts">
  import { FieldNumber } from '@txstate-mws/carbon-svelte'
  export let data: any
</script>

<FieldNumber path="minHours" labelText="Minimum Hours" helperText="What are the minimum Hours to qualify for some programs?" />
<FieldNumber path="maxHours" labelText="Maximum Hours" helperText="What are the maximum Hours to qualify for some programs?" />
