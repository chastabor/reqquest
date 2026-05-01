<script lang="ts">
  import { FieldNumber } from '@txstate-mws/carbon-svelte'
  export let data: any
</script>

<FieldNumber path="minHours" labelText="Min Hours" helperText="Minimum number of Available Hours per Week" />
<FieldNumber path="maxHours" labelText="Max Hours" helperText="Maximum number of Available Hours per Week" />
