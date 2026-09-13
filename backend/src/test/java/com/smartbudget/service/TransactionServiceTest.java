package com.smartbudget.service;

import com.smartbudget.dto.transaction.CreateTransactionRequest;
import com.smartbudget.entity.Account;
import com.smartbudget.entity.Category;
import com.smartbudget.entity.Transaction;
import com.smartbudget.entity.User;
import com.smartbudget.entity.enums.AccountType;
import com.smartbudget.entity.enums.CategoryType;
import com.smartbudget.entity.enums.PaymentMethod;
import com.smartbudget.entity.enums.TransactionType;
import com.smartbudget.repository.AccountRepository;
import com.smartbudget.repository.CategoryRepository;
import com.smartbudget.repository.TransactionRepository;
import com.smartbudget.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AccountService accountService;

    @Mock
    private CategoryService categoryService;

    @InjectMocks
    private TransactionService transactionService;

    private User mockUser;
    private Account sourceAccount;
    private Account targetAccount;
    private Category mockCategory;

    @BeforeEach
    void setUp() {
        mockUser = User.builder().id(1L).email("user@example.com").defaultCurrency("INR").build();

        sourceAccount = Account.builder()
                .id(10L)
                .user(mockUser)
                .name("Savings Account")
                .accountType(AccountType.SAVINGS)
                .balance(new BigDecimal("50000.00"))
                .currency("INR")
                .isActive(true)
                .build();

        targetAccount = Account.builder()
                .id(20L)
                .user(mockUser)
                .name("Wallet")
                .accountType(AccountType.CASH)
                .balance(new BigDecimal("2000.00"))
                .currency("INR")
                .isActive(true)
                .build();

        mockCategory = Category.builder()
                .id(5L)
                .name("Food & Dining")
                .categoryType(CategoryType.EXPENSE)
                .build();
    }

    @Test
    void createTransaction_Expense_DeductsBalance() {
        CreateTransactionRequest request = CreateTransactionRequest.builder()
                .accountId(10L)
                .categoryId(5L)
                .transactionType(TransactionType.EXPENSE)
                .amount(new BigDecimal("1500.00"))
                .transactionDate(LocalDate.now())
                .description("Groceries")
                .paymentMethod(PaymentMethod.UPI)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(accountRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(sourceAccount));
        when(categoryRepository.findById(5L)).thenReturn(Optional.of(mockCategory));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        transactionService.createTransaction(1L, request);

        assertEquals(new BigDecimal("48500.00"), sourceAccount.getBalance());
        verify(accountRepository, times(1)).save(sourceAccount);
        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    void createTransaction_Income_IncreasesBalance() {
        CreateTransactionRequest request = CreateTransactionRequest.builder()
                .accountId(10L)
                .categoryId(5L)
                .transactionType(TransactionType.INCOME)
                .amount(new BigDecimal("25000.00"))
                .transactionDate(LocalDate.now())
                .description("Bonus")
                .paymentMethod(PaymentMethod.NET_BANKING)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(accountRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(sourceAccount));
        when(categoryRepository.findById(5L)).thenReturn(Optional.of(mockCategory));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        transactionService.createTransaction(1L, request);

        assertEquals(new BigDecimal("75000.00"), sourceAccount.getBalance());
        verify(accountRepository, times(1)).save(sourceAccount);
    }

    @Test
    void createTransaction_Transfer_UpdatesBothAccountsAccurately() {
        CreateTransactionRequest request = CreateTransactionRequest.builder()
                .accountId(10L)
                .transferTargetAccountId(20L)
                .categoryId(5L)
                .transactionType(TransactionType.TRANSFER)
                .amount(new BigDecimal("5000.00"))
                .transactionDate(LocalDate.now())
                .description("Transfer to cash wallet")
                .paymentMethod(PaymentMethod.NET_BANKING)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(accountRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(sourceAccount));
        when(accountRepository.findByIdAndUserId(20L, 1L)).thenReturn(Optional.of(targetAccount));
        when(categoryRepository.findById(5L)).thenReturn(Optional.of(mockCategory));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        transactionService.createTransaction(1L, request);

        assertEquals(new BigDecimal("45000.00"), sourceAccount.getBalance());
        assertEquals(new BigDecimal("7000.00"), targetAccount.getBalance());
        verify(accountRepository, times(1)).save(sourceAccount);
        verify(accountRepository, times(1)).save(targetAccount);
    }

    @Test
    void deleteTransaction_Expense_ReversesBalance() {
        Transaction mockTx = Transaction.builder()
                .id(100L)
                .user(mockUser)
                .account(sourceAccount)
                .category(mockCategory)
                .transactionType(TransactionType.EXPENSE)
                .amount(new BigDecimal("2000.00"))
                .build();

        when(transactionRepository.findByIdAndUserId(100L, 1L)).thenReturn(Optional.of(mockTx));

        transactionService.deleteTransaction(100L, 1L);

        assertEquals(new BigDecimal("52000.00"), sourceAccount.getBalance());
        verify(accountRepository, times(1)).save(sourceAccount);
        verify(transactionRepository, times(1)).delete(mockTx);
    }
}
