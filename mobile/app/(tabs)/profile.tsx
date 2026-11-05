import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { User, LogOut, GraduationCap, Mail, Shield, Lock } from "lucide-react-native";
import { useAuth } from "../../src/context/AuthContext";
import { Colors, Spacing } from "../../src/constants/theme";

export default function ProfileScreen() {
  const { user, profile, signIn, signUp, signOut, isLoading } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Kiểm tra định dạng MSSV HANU K20-K26 (10 chữ số)
  function validateHanuMSSV(code: string): boolean {
    if (!/^[0-9]{10}$/.test(code)) return false;
    const cohort = parseInt(code.slice(0, 2), 10);
    return cohort >= 18 && cohort <= 26;
  }

  async function handleAuthAction() {
    if (!email.trim() || !password) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ Email và Mật khẩu.");
      return;
    }

    if (isRegisterMode) {
      if (!studentCode.trim() || !displayName.trim()) {
        Alert.alert("Thiếu thông tin", "Vui lòng nhập MSSV và Tên hiển thị.");
        return;
      }

      if (!validateHanuMSSV(studentCode.trim())) {
        Alert.alert(
          "MSSV không hợp lệ",
          "Mã sinh viên HANU gồm 10 chữ số, thuộc các khóa tuyển sinh hợp lệ (K20 - K26)."
        );
        return;
      }

      setSubmitting(true);
      const res = await signUp({
        email: email.trim(),
        password,
        studentCode: studentCode.trim(),
        displayName: displayName.trim(),
      });
      setSubmitting(false);

      if (res.error) {
        Alert.alert("Đăng ký thất bại", res.error);
      } else {
        Alert.alert(
          "Đăng ký thành công!",
          "Tài khoản của bạn đã được tạo thành công. Chào mừng bạn đến với Hanu Hungry!"
        );
      }
    } else {
      setSubmitting(true);
      const res = await signIn(email.trim(), password);
      setSubmitting(false);

      if (res.error) {
        Alert.alert("Đăng nhập thất bại", "Email hoặc mật khẩu không chính xác.");
      }
    }
  }

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Giao diện khi ĐÃ ĐĂNG NHẬP
  if (user) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarCircle}>
            <User size={38} color="#FFFFFF" />
          </View>
          <Text style={styles.profileName}>
            {profile?.display_name || user.email?.split("@")[0] || "Sinh viên HANU"}
          </Text>
          <View style={styles.roleBadge}>
            <Shield size={12} color={Colors.primary} />
            <Text style={styles.roleBadgeText}>
              {profile?.role === "ADMIN" ? "Quản trị viên" : "Sinh viên HANU"}
            </Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoSectionTitle}>Thông tin tài khoản</Text>

          <View style={styles.infoRow}>
            <GraduationCap size={18} color={Colors.muted} />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Mã sinh viên (MSSV)</Text>
              <Text style={styles.infoValue}>
                {profile?.student_code || "Chưa cập nhật"}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Mail size={18} color={Colors.muted} />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Địa chỉ Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.signOutButton}
          activeOpacity={0.85}
          onPress={() => {
            Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất không?", [
              { text: "Hủy", style: "cancel" },
              { text: "Đăng xuất", style: "destructive", onPress: signOut },
            ]);
          }}
        >
          <LogOut size={18} color={Colors.error} />
          <Text style={styles.signOutButtonText}>Đăng xuất tài khoản</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Giao diện khi CHƯA ĐĂNG NHẬP (Form Đăng nhập / Đăng ký)
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.authContent}>
      <View style={styles.authCard}>
        <Text style={styles.authTitle}>
          {isRegisterMode ? "ĐĂNG KÝ SINH VIÊN" : "ĐĂNG NHẬP"}
        </Text>
        <Text style={styles.authSubtitle}>
          {isRegisterMode
            ? "Tạo tài khoản sinh viên HANU để tích lũy chuỗi ngày ẩm thực"
            : "Chào mừng bạn quay lại với Hanu Hungry"}
        </Text>

        {isRegisterMode ? (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mã sinh viên (MSSV)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ví dụ: 2404060021"
                placeholderTextColor={Colors.muted}
                keyboardType="numeric"
                maxLength={10}
                value={studentCode}
                onChangeText={setStudentCode}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tên hiển thị</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Họ và tên của bạn"
                placeholderTextColor={Colors.muted}
                value={displayName}
                onChangeText={setDisplayName}
              />
            </View>
          </>
        ) : null}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.textInput}
            placeholder="email@gmail.com hoặc @hanu.edu.vn"
            placeholderTextColor={Colors.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Mật khẩu</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Tối thiểu 8 ký tự"
            placeholderTextColor={Colors.muted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          activeOpacity={0.85}
          disabled={submitting}
          onPress={handleAuthAction}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isRegisterMode ? "Đăng ký tài khoản" : "Đăng nhập ngay"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.toggleAuthButton}
          onPress={() => setIsRegisterMode(!isRegisterMode)}
        >
          <Text style={styles.toggleAuthText}>
            {isRegisterMode
              ? "Đã có tài khoản? Đăng nhập ngay"
              : "Chưa có tài khoản? Đăng ký sinh viên HANU"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  authContent: {
    padding: Spacing.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileHeaderCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    alignItems: "center",
    margin: Spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.ink,
    marginBottom: 6,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary,
  },
  infoSection: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    marginBottom: Spacing.lg,
  },
  infoSectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.ink,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lineLight,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: Colors.muted,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.ink,
    marginTop: 2,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FFC9C9",
    marginBottom: 40,
  },
  signOutButtonText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: "700",
  },
  authCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  authTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.primary,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  authSubtitle: {
    fontSize: 12,
    color: Colors.muted,
    textAlign: "center",
    marginTop: 4,
    marginBottom: Spacing.xl,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.ink,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: Colors.background,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.line,
    paddingHorizontal: Spacing.md,
    fontSize: 14,
    color: Colors.ink,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  toggleAuthButton: {
    marginTop: Spacing.lg,
    alignItems: "center",
    paddingVertical: 6,
  },
  toggleAuthText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
  },
});
