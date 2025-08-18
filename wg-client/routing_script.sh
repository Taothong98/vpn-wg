
# docker exec IperfClient1 iptables -t nat -A POSTROUTING -d 172.16.1.0/24 -j MASQUERADE
# docker exec IperfClient1 iptables -t nat -A POSTROUTING -d 10.255.0.0/16 -j MASQUERADE

# iptables -t nat -A POSTROUTING -d 172.16.1.0/24 -j MASQUERADE
# iptables -t nat -A POSTROUTING -d 10.255.0.0/16 -j MASQUERADE


# docker exec IperfClient1 iptables -t nat -A POSTROUTING -s 10.0.0.0/24 -j MASQUERADE
iptables -t nat -A POSTROUTING -s 10.0.0.0/24 -j MASQUERADE

iptables -L -v -n
iptables -t nat -L -v -n
# docker exec IperfClient1 sysctl -w net.ipv4.ip_forward=1
# docker exec IperfClient1 sysctl -p

sysctl -w net.ipv4.ip_forward=1
sysctl -p
sysctl net.ipv4.ip_forward

ip route

# ip route del 10.255.0.0/16
ip route del 10.255.0.0/16 dev wg0

iptables -I FORWARD -s 10.0.0.0/24 -d 10.255.0.0/16 -j ACCEPT
iptables -I FORWARD -d 10.0.0.0/24 -s 10.255.0.0/16 -j ACCEPT

iptables -L FORWARD -v -n
########################################
192.168.151.1 คือ GateWay ของ docker 
iptables -t nat -A POSTROUTING -d 192.168.151.0/24 -j MASQUERADE


docker exec IperfClient1 ping 10.255.0.253
docker exec IperfClient1 traceroute 10.255.0.253

docker exec IperfClient1 ip route add 172.16.1.0/24 via 192.168.151.1 
docker exec IperfClient1 ip route add 10.255.0.0/16 via 192.168.151.1 


######################### windows ############################
10.0.0.0/24, 172.16.1.0/24, 10.255.0.0/16


tracert 172.16.1.201
tracert 10.255.0.1

route add 172.16.1.0 mask 255.255.255.0 10.0.0.3
route add 10.255.0.0 mask 255.255.0.0 10.0.0.3
route print

ping 10.255.0.1
ping 172.16.1.201