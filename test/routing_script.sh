
########### usertest ##############
ping 10.0.0.1
ping 10.0.0.3
ping 192.168.200.50
ping 192.168.200.1
traceroute 192.168.200.50


########### vpn-server ##############
ping 10.0.0.1
ping 10.0.0.3
ping 192.168.200.50
ping 192.168.200.1
traceroute 192.168.200.50
traceroute 192.168.200.1
ip route
ip route del 192.168.200.0/24
ip route add 192.168.200.0/24 via 10.0.0.3 dev wg0
wg show
wg-quick down wg0 && wg-quick up wg0
docker exec VPNserver wg-quick down wg0 && wg-quick up wg0

แก้ไข wg0.json  ***************
"address": "192.168.200.0/24, 10.0.0.2",

########### local-server ##############

iptables -t nat -A POSTROUTING -s 10.0.0.0/24 -j MASQUERADE
iptables -t nat -A POSTROUTING -d 192.168.200.0/24 -j MASQUERADE

iptables -A FORWARD -d 192.168.200.0/24 -j ACCEPT

ping 192.168.200.50
ping 192.168.200.1

iptables -L -v -n

 # for sec AllowedIP only specific IP 
ทำ AllowedIPs = 10.0.0.0/32