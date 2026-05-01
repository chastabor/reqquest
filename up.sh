
DEMO_INSTANCE="default"

while getopts ":dsmcr" opt
do
  case "$opt" in
    d) DEMO_INSTANCE="default";;
    s) DEMO_INSTANCE="simple";;
    m) DEMO_INSTANCE="multi";;
    c) DEMO_INSTANCE="complex";;
    r) DEMO_INSTANCE="rc2";;
  esac
done

shift $((OPTIND -1))

# If a service name is specified, add -d to run in detached mode
if [ $# -ge 1 ]; then
  DEMO_INSTANCE=${DEMO_INSTANCE} docker compose up --build -d $@
else
  DEMO_INSTANCE=${DEMO_INSTANCE} docker compose up --build
fi
