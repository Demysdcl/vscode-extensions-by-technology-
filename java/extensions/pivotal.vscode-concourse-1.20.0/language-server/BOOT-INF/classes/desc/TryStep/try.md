Permit failure of a step.

	try: step

Performs the given step, swallowing any failure.

This can be used when you want to perform some side-effect, but you don't really want the whole build to fail if it doesn't work. For example, when emitting logs to S3 for analyzing later, if S3 flakes out it's not too critical.

	plan:
	- task: run-tests
	  config: # ...
	  on_success:
	    try:
	      put: test-logs
	      from: run-tests/*.log
	- task: do-something-else
	  config: # ...