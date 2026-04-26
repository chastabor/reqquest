<script lang="ts">
  export let data: any
  export let gatheredConfigData: any
</script>

Applicant is {data.residentOfRequiredState ? '' : 'NOT'} a resident of {gatheredConfigData.residentOfState}. Applicant's home is {data.residenceIsHome ? '' : 'NOT'} within the state of {gatheredConfigData.residentOfState}.
