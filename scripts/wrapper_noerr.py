#!/usr/bin/python

# run any command line and do not emit it's standard error or output unless there is an error

import sys # for argv
import subprocess # for Popen

# this function is here because python2.6 does not have subprocess.check_output
def system_check_output(args):
	pr=subprocess.Popen(args,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
	(output,errout)=pr.communicate()
	status=pr.returncode
	if output!='':
		print output
	if errout!='':
		print errout
	#sys.exit(status);
	sys.exit(0);

if len(sys.argv)<1:
	raise ValueError('command line issue')

# run the command
system_check_output(sys.argv[1:])
