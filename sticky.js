//stikcy.js 파일
const express = require('express')
const axios = require('axios')

const loadBalancer = express()

let idx = 0
const serverList = [
    '127.0.0.1:3000',
    '127.0.0.1:3001',
    '127.0.0.1:3002',
]

// Map 객체를 사용하여 (클라이언트 IP 주소-특정 서버) 매핑
const clientToServerMap = new Map()

loadBalancer.get('/favicon.ico', (req, res) => {
    res.status(204)
})

loadBalancer.all("*", (req, res) => {
    const { method, protocol, originalUrl,ip } = req

    let target
    if(clientToServerMap.has(ip)){
        target = clientToServerMap.get(ip)
    }else{
        // Map에 없다면 라운드 로빈 방식으로 서버를 선택
        target = serverList[idx++]
        if(idx >= serverList.length) idx = 0
        clientToServerMap.set(ip,target)
        // 선택한 서버를 Map에 매핑
    }

    const requestUrl = `${protocol}://${target}${originalUrl}`

    axios.request(requestUrl, {
        method
    })
        .then(result => {
            res.set({...result.headers})
            res.send(result.data)
        })
        .catch(error => {
            res.set({...error.headers})
            res.send(error)
        })
})

loadBalancer.listen(8080, err =>{
    err ?
    console.log('로드 밸런서 80번 포트에서 시작 실패'):
    console.log('로드 밸런서 80번 포트에서 시작')
})