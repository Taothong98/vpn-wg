



# docker exec IperfClient1 iptables -t nat -A POSTROUTING -s 10.0.0.0/24 -j MASQUERADE
# docker exec IperfClient1 iptables -t nat -A POSTROUTING -d 10.255.0.0/16 -j MASQUERADE
iptables -L FORWARD -v -n
iptables -t nat -A POSTROUTING -s 10.0.0.0/24 -j MASQUERADE
# iptables -t nat -A POSTROUTING -d 10.255.0.0/16 -j MASQUERADE
iptables -L FORWARD -v -n

# docker exec IperfClient1 sysctl -w net.ipv4.ip_forward=1
# docker exec IperfClient1 sysctl -p
sysctl net.ipv4.ip_forward
sysctl -w net.ipv4.ip_forward=1
sysctl -p
sysctl net.ipv4.ip_forward


iptables -L -v -n
iptables -I FORWARD -s 10.0.0.0/24 -d 10.255.0.0/16 -j ACCEPT
iptables -I FORWARD -d 10.0.0.0/24 -s 10.255.0.0/16 -j ACCEPT
iptables -L -v -n



ip route
# ip route del 10.255.0.0/16
# ip route add
# docker exec IperfClient1 ip route add 172.16.1.0/24 via 192.168.151.1 
# docker exec IperfClient1 ip route add 10.255.0.0/16 via 192.168.151.1 
ip route
########################## link 2 ###############################

iptables -I FORWARD -s 10.0.0.0/24 -d 172.16.1.0/24 -j ACCEPT
iptables -I FORWARD -d 10.0.0.0/24 -s 172.16.1.0/24 -j ACCEPT
iptables -L FORWARD -v -n






######################### windows ############################
10.0.0.0/24, 172.16.1.0/24, 10.255.0.0/16


tracert 172.16.1.201
tracert 10.255.0.1

route add 172.16.1.0 mask 255.255.255.0 10.0.0.1
route add 10.255.0.0 mask 255.255.0.0 10.0.0.1
route print

ping 10.255.0.1
ping 172.16.1.201