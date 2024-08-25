const express = require('express')
const axios = require('axios')
const crypto = require('crypto') 
// 해싱을 위해 crypto 모듈 사용

const loadBalancer = express()

const serverList = [
    '127.0.0.1:3000',
    '127.0.0.1:3001',
    '127.0.0.1:3002',
]

loadBalancer.get('/favicon.ico', (req, res) => {
    res.status(204)
})

const getServerFromIpHash = (ip) => {
    const hash = crypto.createHash('md5').update(ip).digest('hex');
    // ip주소를 md5해시로 변환
    const serverIndex = parseInt(hash,16) % serverList.length;
    // serverList의 길이로 나누고 나머지 값을 이용하여 특정 서버 선택
    return serverList[serverIndex];
}

// 요청 핸들러 작성
loadBalancer.all("*", (req, res) => {
    const { method, protocol, originalUrl, ip } = req

    const target = getServerFromIpHash(ip);

    const requestUrl = `${protocol}://${target}${originalUrl}`

    // axios를 사용해 타겟 서버로 요청을 전달
    axios.request({
        url: requestUrl,
        method
    })
    .then(result => {
        // 타겟 서버로부터 받은 응답을 클라이언트에 전달
        res.set({...result.headers});
        res.send(result.data);
    })
    .catch(error => {
        res.status(error.response ? error.response.status : 500).send(error.message);
    });
})

// 80번 포트에서 로드 밸런서 시작
loadBalancer.listen(80, err =>{
    err ?
    console.log('로드 밸런서 80번 포트에서 시작 실패'):
    console.log('로드 밸런서 80번 포트에서 시작')
})