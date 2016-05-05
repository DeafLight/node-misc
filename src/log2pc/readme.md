http://edgystuff.tumblr.com/post/93523827905/how-to-implement-robust-and-scalable-transactions

concept:

maintain a queue where all save requests are logged. On each push, an event is triggered, calling a service that will empty
the queue by executing the requests one by one

executes two phase commit if more than one document is present in the request, normal commit otherwise (check insert correctness anyway)

optional: save the modified data to be able to rollback

pb: how to check unicity among objects not yet created (or when updating unique values) ?
pb: how to prioritize requests in case of long running jobs, not necessarily needing ACID, but flooding the queues with long lists of data, making the queue bloated when a regular request comes in ?
    - potential solution : maintain 2 queues, one takes priority

transaction log
{
    status: init, pending, applied, done
    tasks: [
        {
            type: 'create',
            model: testModel1,
            val: {
                _id : "",
                name: "",
                ...
            }
        },
        {
            type: 'update',
            model: testModel1,
            filter: {...}
            val: {
                name: "",
                contacts: {
                    $push: [{...}, {...}],
                    $remove: [{...}, {...}],
                    $update:
                }
            }
        },
        {
            type: 'delete',
            model: testModel1,
            filter: {...}
        }
    ]
}