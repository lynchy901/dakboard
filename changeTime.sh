#!/bin/bash
echo "Changing crontab..."
echo "$1" >> output.txt
echo "$2" >> output.txt
echo "$3" >> output.txt
echo "" >> output.txt
crontab output.txt
echo "Done changing crontab"
rm output.txt*;
