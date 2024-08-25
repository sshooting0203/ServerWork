const express = require('express')
const axios = require('axios')

const loadBalancer = express()

const serverList = [
    { url: '127.0.0.1:3000', weight: 5 },  // 높은 가중치를 가진 서버
    { url: '127.0.0.1:3001', weight: 2 },  // 중간 가중치를 가진 서버
    { url: '127.0.0.1:3002', weight: 1 },  // 낮은 가중치를 가진 서버
]
// 가중치가 5인 서버는 5번의 요청을 받을 수 있음

loadBalancer.get('/favicon.ico', (req, res) => {
    res.status(204);
})

let currentIndex = 0;
let currentWeight = 0;

const getNextServer = () => {
    while(true){
        currentIndex = (currentIndex+1) %serverList.length;
        // 서버리스트를 순환하며 탐색
        if(currentIndex==0){ 
            // 모든 서버를 한 번 순회 완료
            currentWeight = currentWeight - 1;
            if(currentWeight<=0){
                currentWeight = Math.max(...serverList.map(s=>s.weight))
                // 모든 서버가 한 바퀴를 돌면 서버리스트에서 가장 높은 가중치로 설정
                if(currentWeight==0){
                    // 예외적인 상황을 대비한 코드임
                    return null;
                }
            }
        }
        if(serverList[currentIndex].weight >= currentWeight){
            // 현재 서버의 가중치가 currentWeight보다 크거나 같으면, 해당 서버 선택
            return serverList[currentIndex].url;
        }
    }
}


// 요청 핸들러 작성
loadBalancer.all("*", (req, res) => {
    const { method, protocol, originalUrl } = req

    const target = getNextServer();

    const requestUrl = `${protocol}://${target}${originalUrl}`

    axios({
        url: requestUrl,
        method: method,
    })
    .then(result => {
        res.set({ ...result.headers });
        res.send(result.data);
    })
    .catch(error => {
        const errorResponse = error.response || {};
        const status = errorResponse.status || 500;
        const message = errorResponse.data || 'Internal Server Error';
        res.status(status).send(message);
    });
})

// 80번 포트에서 로드 밸런서 시작
loadBalancer.listen(80, err =>{
    err ?
    console.log('로드 밸런서 80번 포트에서 시작 실패'):
    console.log('로드 밸런서 80번 포트에서 시작')
})