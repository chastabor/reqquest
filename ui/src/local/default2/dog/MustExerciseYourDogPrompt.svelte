<script lang="ts">
  import { FieldNumber } from '@txstate-mws/carbon-svelte'
  export let data: any
  export let gatheredConfigData: any
</script>

<FieldNumber path="exerciseHours" labelText="Exercise Per Week" helperText="How many hours per week will you be able to exercise the dog, on average?" />
