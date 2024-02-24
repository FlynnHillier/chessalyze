import * as React from 'react';
import { trpc } from '../../util/trpc';


const TestTRPC = () => {
    const testQuery = trpc.a.hello.useQuery()


    const onClick = () => {
        console.log(testQuery.data)
    }
    
    return (
        <div>
            <button onClick={onClick}>trpc test</button>
        </div>
    );
}
 
export default TestTRPC;